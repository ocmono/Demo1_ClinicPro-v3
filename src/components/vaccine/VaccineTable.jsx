import React, { useEffect, useRef, useState } from 'react';
import Table from '@/components/shared/table/Table';
import { FiEdit3, FiEye, FiMoreHorizontal, FiPrinter, FiTrash2 } from 'react-icons/fi';
import Dropdown from '@/components/shared/Dropdown';
import { Link } from 'react-router-dom';
import useCardTitleActions from "@/hooks/useCardTitleActions";
import { useVaccine } from "../../context/VaccineContext";
import VaccineViewPage from './VaccineViewPage';
import { useNavigate } from 'react-router-dom';
import EditVaccineModal from './EditVaccineModal';
import { useMemo } from 'react';


const VaccineTable = ({
  onEditClick = () => {},
  onViewClick = () => {},
  canDelete = true,
  canEdit = true,
  canView = true,
  showPrint = true
}) => {
  const { vaccines, deleteVaccine, updateVaccine } = useVaccine();
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
    return vaccines.map((v) => ({
      id: v.id,
      vaccine_name: v.vaccine_name,
      age_group: v.age_group,
      description: v.description || "—",
      administrator: v.route_of_administration || "—",
      site: v.site || "—",
      min_age: v.min_age_days || "—",
      max_age: v.max_age_days || "—",
      dose_number: v.dose_number,
      interval_days: v.repeat_interval_days,
      is_active: v.is_active ? "Yes" : "No",
      mandatory: v.mandatory ? "Yes" : "No",
      // user_id: v.created_by,
      actions: v
    }));
  }, [vaccines]);
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
    { accessorKey: 'vaccine_name', header: () => 'Vaccine Name' },
    { accessorKey: 'age_group', header: () => 'Age Group' },
    { accessorKey: 'administrator', header: () => 'Administrator' },
    { accessorKey: 'site', header: () => 'Site' },
    { accessorKey: 'min_age', header: () => 'Min Days' },
    { accessorKey: 'max_age', header: () => 'Max Days' },
    { accessorKey: 'interval_days', header: () => 'Repeat Interval Day' },
    { accessorKey: 'dose_number', header: () => 'Dose No' },
    { accessorKey: 'mandatory', header: () => 'Mandatory' },
    // { accessorKey: 'user_id', header: () => 'User Id' },
    { accessorKey: 'is_active', header: () => 'Active' },
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
                setSelectedVaccine(vaccine);
                setEditModalOpen(true);
              } else if (label === "View") {
                navigate(`/vaccine/view/${vaccine.id}`, { state: { vaccine } });
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
        emptyMessage={"No Vaccine Data found"}
        />
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {printVaccine && (
          <div ref={printRef}>
            <VaccineViewPage vaccine={printVaccine} isPrintMode/>
          </div>
        )}
      </div>
      {editModalOpen && selectedVaccine && (
        <EditVaccineModal
          vaccine={selectedVaccine}
          onClose={() => setEditModalOpen(false)}
          onSave={(updatedData) => {
            updateVaccine(updatedData); // update in context
            setEditModalOpen(false);
            setSelectedVaccine(null);
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
                    const index = vaccines.findIndex(v => v.id === vaccineToDelete.id);
                    if (index !== -1) deleteVaccine(index);
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

export default VaccineTable;
