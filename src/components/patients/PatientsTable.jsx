import React, { useMemo, useEffect, useState, useRef } from 'react';
import Table from '@/components/shared/table/Table';
import {
  FiAlertOctagon, FiArchive, FiClock, FiEdit3, FiEye, FiMoreHorizontal, FiPrinter, FiTrash2
} from 'react-icons/fi';
import Dropdown from '@/components/shared/Dropdown';
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { usePatient } from "../../context/PatientContext";
import useCardTitleActions from "@/hooks/useCardTitleActions";
import PatientModal from './PatientModal';

const actionsOptions = [
  { label: "Edit", icon: <FiEdit3 /> },
  { label: "Print", icon: <FiPrinter /> },
  // { label: "Delete", icon: <FiTrash2 /> },
];

// Add this helper function at the top of your component
const getImageSrc = (image) => {
  if (!image) return null;

  // If it's a File object, create object URL
  if (image instanceof File) {
    try {
      return URL.createObjectURL(image);
    } catch (error) {
      console.error('Error creating object URL:', error);
      return null;
    }
  }

  // If it's a string (URL), use it directly
  if (typeof image === 'string') {
    return image;
  }

  // If it's an object with url property
  if (image && typeof image === 'object' && image.url) {
    return image.url;
  }

  // If it's an object with image_urls property (from your data structure)
  if (image && typeof image === 'object' && image.image_urls && Array.isArray(image.image_urls)) {
    return image.image_urls[0] || null;
  }

  return null;
};

const PatientsTable = ({
  onAddClick = () => { },
  onEditClick = () => { },
  onViewClick = () => { },
  showAddButton = false,
  canDelete = false,
  canEdit = false,
  canView = true,
  canPrint = true,
  showPrint = true
}) => {
  const { patients, deletePatient, loading } = usePatient();
  
  // Debug logging
  useEffect(() => {
    console.log("PatientsTable - Current patients:", patients);
    console.log("PatientsTable - Loading state:", loading);
  }, [patients, loading]);

  const { isRemoved } = useCardTitleActions();
  const printRef = useRef();
  const [forcePageSize, setForcePageSize] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // view | edit | add
  const currentPageRef = useRef(0);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (page) => {
    currentPageRef.current = page;
    setCurrentPage(page); // Update state as well
  };


  if (isRemoved) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    const printHTML = `
    <html>
      <head>
        <title>Print Patients</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
            word-wrap: break-word;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h2>Patients List</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Age</th>
              <th>Blood Group</th>
              <th>Gender</th>
            </tr>
          </thead>
          <tbody>
            ${patients.map((p) => `
              <tr>
                <td>${p.name || "—"}</td>
                <td>${p.email || "—"}</td>
                <td>${p.contact || "—"}</td>
                <td>${p.age || "—"}</td>
                <td>${p.bloodGroup || "—"}</td>
                <td>${p.gender || "—"}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const actionOptions = [];
  if (canView) actionOptions.push({ icon: <FaEye />, label: "View" });
  if (canEdit) actionOptions.push({ icon: <FaEdit />, label: "Edit" });
  if (canDelete) actionOptions.push({ icon: <FaTrash />, label: "Delete" });

  const tableData = useMemo(() => {
    return patients.map((p) => {
      return {
        id: p.id || p._id,
        name: {
          name: p.name
        },
        email: p.email,
        phone: p.contact,
        date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—',
        age: p.age,
        bloodGroup: p.bloodGroup || '—',
        gender: p.gender,
        actions: p.actions || p,
      }
    });
  }, [patients]);

  const handleNameClick = (patient) => {
    setSelectedPatient(patient);
    setModalMode("view");
    setEditModalOpen(true);
  };


  const columns =  [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: (info) => (
        <span className="badge bg-light text-dark">#{info.getValue()}</span>
      ),
      meta: {
        headerClassName: 'width-30',
      },
    },
    {
      accessorKey: 'name',
      header: () => 'Name',
      cell: ({ getValue, row }) => {
        const value = getValue();
        const patient = row.original.actions;

        // Add null/undefined checks
        if (!value || !value.name) {
          return (
            <div className="hstack gap-3">
              <div className="text-white avatar-text user-avatar-text avatar-md no-print">
                ?
              </div>
              <div>Unknown</div>
            </div>
          );
        }

        return (
          <div
            className="hstack gap-3 cursor-pointer"
            style={{ cursor: 'pointer' }}
            onClick={() => handleNameClick(patient)}
            title="Click to view patient details"
          >
            {value.img ? (
              <div className="avatar-image avatar-md">
                <img src={value.img} alt={value.name} className="img-fluid" />
              </div>
            ) : (
              <div className="text-white avatar-text user-avatar-text avatar-md no-print">
                {value.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-primary fw-medium">{value.name}</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'email',
      header: () => 'Email',
      cell: ({ getValue }) => <a href={`mailto:${getValue()}`}>{getValue()}</a>,
    },
    {
      accessorKey: 'phone',
      header: () => 'Phone',
      cell: ({ getValue }) => <a href={`tel:${getValue()}`}>{getValue()}</a>,
    },
    { accessorKey: 'age', header: () => 'Age' },
    { accessorKey: 'bloodGroup', header: () => 'Blood Group' },
    { accessorKey: 'gender', header: () => 'Gender' }, 
  ];

  return (
    <>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading patients...</p>
        </div>
      ) : (
        <>
            {/* <div className="mb-3">
            <small className="text-muted">
              Total patients: {patients.length}
              {patients.length > 0 && patients[0]?.id && patients[0].id > 1000000000000 && (
                <span className="text-info ms-2">(Demo mode active)</span>
              )}
            </small>
          </div> */}
            <Table data={tableData} columns={columns} onPrint={handlePrint} showPrint={showPrint} printRef={printRef}
              forcePageSize={forcePageSize} emptyMessage={"No Patient Data found"} defaultSorting={[{ id: 'id', desc: true }]} pageIndex={currentPage} onPageChange={handlePageChange}
              cardHeader={<h5 class="card-title mb-0">Patients List</h5>}
            />
        </>
      )}
      {editModalOpen && (
        <PatientModal
          patient={selectedPatient}
          mode={modalMode}
          close={() => setEditModalOpen(false)}
        />
      )}
    </>
  );
};

export default PatientsTable;
