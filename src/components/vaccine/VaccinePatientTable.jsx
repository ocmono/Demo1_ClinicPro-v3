import React, { useEffect, useRef, useState } from 'react';
import Table from '@/components/shared/table/Table';
import { FiEdit3, FiEye, FiMoreHorizontal, FiPrinter, FiTrash2 } from 'react-icons/fi';
import Dropdown from '@/components/shared/Dropdown';
import { Link } from 'react-router-dom';
import useCardTitleActions from "@/hooks/useCardTitleActions";
import { useVaccine } from "../../context/VaccineContext";
import VaccineViewPage from './VaccineViewPage';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useBooking } from '../../contentApi/BookingProvider';
import EditVaccinePatientModal from "./EditPatientVaccine";


const VaccinePatientTable = ({
  onEditClick = () => {},
  onViewClick = () => {},
  canDelete = true,
  canEdit = true,
  canView = true,
  showPrint = true
}) => {
  const { vaccines, deleteVaccine, updateVaccine, fetchPatientVaccines, patientVaccines, editPatientVaccine, deletePatientVaccine } = useVaccine();
  console.log("Fetched Patient Vaccinated Data", patientVaccines);
  const { doctors } = useBooking();
  console.log("Doctors", doctors);

  const { isRemoved } = useCardTitleActions();
  const printRef = useRef();
  const [forcePageSize, setForcePageSize] = useState(null);
  const [printVaccine, setPrintVaccine] = useState(null);
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState(null);
  
  if (isRemoved) return null;
  
  const handlePrint = () => {
    setForcePageSize(9999);
    setTimeout(() => {
      if (!printRef.current) return;

      const clonedTable = printRef.current.cloneNode(true);
      Array.from(clonedTable.querySelectorAll("tr")).forEach(row => {
        if (row.cells.length > 0) {
          row.deleteCell(row.cells.length - 1); // remove action cell
          row.deleteCell(0); // remove checkbox cell
        }
      });

      clonedTable.querySelectorAll(".no-print").forEach(el => el.remove());

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html><head><title>Print Vaccine Data</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background: #f5f5f5; }
        </style>
        </head><body>
      `);
      printWindow.document.write(clonedTable.outerHTML);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        setForcePageSize(null);
      };
    }, 0);
  };

  const actionOptions = [];
  if (canView) actionOptions.push({ icon: <FiEye />, label: "View" });
  if (canEdit) actionOptions.push({ icon: <FiEdit3 />, label: "Edit" });
  if (canDelete) actionOptions.push({ icon: <FiTrash2 />, label: "Delete" });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  const tableData = useMemo(() => {
  return patientVaccines.map((v) => {
    const doctor = doctors.find((d) => d.id === v.doctor_id);
    const vaccine = v.assigned_vaccines?.[0]; // show first vaccine only

    return {
      id: v.id,
      patient_name: v.patient_name,
      dob: v.dob,
      gender: v.gender || "—",
      parent_name: v.parent_name || "—",
      contact_number: v.contact_number || "—",
      // address: v.address || "—",
      birth_weight: v.birth_weight || "—",
      registration_date: v.registration_date,
      notes:v.notes || "—",
      doctor_name: doctor ? `${doctor.firstName} ${doctor.lastName}` : "—",
      vaccine_name: vaccine?.vaccine_name || "—",
      status: v.status || vaccine?.status || "—",
      actions: v
    };
  });
}, [patientVaccines, doctors]);
  const columns = [
    {
      accessorKey: 'id',
      header: ({ table }) => {
        const checkboxRef = useRef(null);
        useEffect(() => {
          if (checkboxRef.current) {
            checkboxRef.current.indeterminate = table.getIsSomeRowsSelected();
          }
        }, [table.getIsSomeRowsSelected()]);
        return (
          <input
            type="checkbox"
            ref={checkboxRef}
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        );
      },
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      meta: { headerClassName: 'width-30' },
    },
    { accessorKey: 'patient_name', header: () => 'Patient Name' },
    { accessorKey: 'dob', header: () => 'Date of Birth' },
    { accessorKey: 'gender', header: () => 'Gender' },
    { accessorKey: 'parent_name', header: () => 'Parent Name' },
    { accessorKey: 'contact_number', header: () => 'Contact' },
    // { accessorKey: 'address', header: () => 'Address' },
    { accessorKey: 'birth_weight', header: () => 'Birth Weight' },
    { accessorKey: 'notes', header: () => 'Notes' },
    // { accessorKey: 'registration_date', header: () => 'Registration Date' },
    { accessorKey: 'doctor_name', header: () => 'Doctor' },
    // { accessorKey: 'user_id', header: () => 'User Id' },
    { accessorKey: 'vaccine_name', header: () => 'Vaccine Name' },
    { accessorKey: 'status', header: () => 'Status' },
    {
      accessorKey: 'actions',
      header: () => "Actions",
      cell: ({ row }) => {
        const vaccine = row.original.actions;
        return (
          <Dropdown
            dropdownItems={actionOptions}
            triggerClass="avatar-md"
            triggerPosition={"0,21"}
            triggerIcon={<FiMoreHorizontal />}
            onClick={(label) => {
              if (label === "Edit") {
                const vaccineToEdit = {
                  ...vaccine,
                  status: vaccine.assigned_vaccines?.[0]?.status || ""
                };
                setSelectedVaccine(vaccineToEdit);
                setEditModalOpen(true);
              } else if (label === "View") {
                navigate(`/vaccine/vaccine-patient-view/${vaccine.id}`, { state: { vaccine } });
              } else if (label === "Delete") {
                setVaccineToDelete(vaccine);
                setConfirmDelete(true);
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
      <Table
        data={tableData}
        columns={columns}
        onPrint={handlePrint}
        showPrint={showPrint}
        printRef={printRef}
        forcePageSize={forcePageSize}
        emptyMessage={"No Vaccinated Patient Data found"}
        />
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {printVaccine && (
          <div ref={printRef}>
            <VaccineViewPage vaccine={printVaccine} isPrintMode/>
          </div>
        )}
      </div>
      {editModalOpen && selectedVaccine && (
        <EditVaccinePatientModal
          vaccine={selectedVaccine}
          onClose={() => setEditModalOpen(false)}
          onSave={async (updated) => {
          await editPatientVaccine(updated);  // wait for PUT
          await fetchPatientVaccines();       // refresh table data
          setEditModalOpen(false);
        }}
        />
      )}
      {confirmDelete && vaccineToDelete && (
        <div className="modal-overlay">
          <div className="card" style={{ maxWidth: 400, margin: "15% auto", padding: 24 }}>
            <div className="card-body">
              <h5>Confirm Delete</h5>
              <p>Are you sure you want to delete <strong>{vaccineToDelete.vaccine_name}</strong>?</p>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    deletePatientVaccine(vaccineToDelete.id);
                    setConfirmDelete(false);
                    setVaccineToDelete(null);
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setConfirmDelete(false);
                    setVaccineToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VaccinePatientTable;
