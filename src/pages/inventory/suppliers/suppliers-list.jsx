import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import Table from '@/components/shared/table/Table';
import { FiEdit3, FiEye, FiTrash2, FiPhone, FiMail, FiUser } from 'react-icons/fi';
import SuppliersEditModal from './suppliers-edit';
import SuppliersHeader from '@/components/inventory/SuppliersHeader';
import { useSuppliers } from '../../../contentApi/SuppliersProvider';
import SupplierDeleteModal from './supplier-delete';
import Footer from '@/components/shared/Footer';

// const mockSuppliers = [
//   { id: 1, name: 'Acme Pharma', contact: 'John Doe', email: 'john@acme.com', phone: '+1-555-0101', address: '123 Medical St, NY', status: 'Active', created_at: '2024-01-15' },
//   { id: 2, name: 'Global Meds', contact: 'Jane Smith', email: 'jane@globalmeds.com', phone: '+1-555-0102', address: '456 Pharma Ave, CA', status: 'Active', created_at: '2024-01-20' },
//   { id: 3, name: 'MediLife Suppliers', contact: 'Alice Brown', email: 'alice@medilife.com', phone: '+1-555-0103', address: '789 Health Blvd, TX', status: 'Active', created_at: '2024-02-01' },
//   { id: 4, name: 'HealWell Traders', contact: 'Bob White', email: 'bob@healwell.com', phone: '+1-555-0104', address: '321 Wellness Dr, FL', status: 'Inactive', created_at: '2024-02-10' },
//   { id: 5, name: 'PharmaPlus', contact: 'Carol Green', email: 'carol@pharmaplus.com', phone: '+1-555-0105', address: '654 Medicine Rd, IL', status: 'Active', created_at: '2024-02-15' },
//   { id: 6, name: 'Zenith Drugs', contact: 'David Black', email: 'david@zenithdrugs.com', phone: '+1-555-0106', address: '987 Drug St, WA', status: 'Active', created_at: '2024-03-01' },
//   { id: 7, name: 'Sunrise Pharma', contact: 'Eva Blue', email: 'eva@sunrisepharma.com', phone: '+1-555-0107', address: '147 Sunrise Ave, OR', status: 'Active', created_at: '2024-03-05' },
//   { id: 8, name: 'Nova Distributors', contact: 'Frank Red', email: 'frank@novadist.com', phone: '+1-555-0108', address: '258 Nova Blvd, NV', status: 'Active', created_at: '2024-03-10' },
//   { id: 9, name: 'Prime Meds', contact: 'Grace Yellow', email: 'grace@primemeds.com', phone: '+1-555-0109', address: '369 Prime St, AZ', status: 'Pending', created_at: '2024-03-15' },
//   { id: 10, name: 'Apex Medical', contact: 'Henry Violet', email: 'henry@apexmed.com', phone: '+1-555-0110', address: '741 Apex Dr, CO', status: 'Active', created_at: '2024-03-20' },
//   { id: 11, name: 'Vertex Pharma', contact: 'Ivy Orange', email: 'ivy@vertexpharma.com', phone: '+1-555-0111', address: '852 Vertex Ave, UT', status: 'Active', created_at: '2024-03-25' },
//   { id: 12, name: 'Optima Health', contact: 'Jack Silver', email: 'jack@optimahealth.com', phone: '+1-555-0112', address: '963 Optima Rd, ID', status: 'Active', created_at: '2024-04-01' },
//   { id: 13, name: 'Everest Med', contact: 'Karen Gold', email: 'karen@everestmed.com', phone: '+1-555-0113', address: '159 Everest St, MT', status: 'Active', created_at: '2024-04-05' },
//   { id: 14, name: 'Summit Drugs', contact: 'Leo Indigo', email: 'leo@summitdrugs.com', phone: '+1-555-0114', address: '357 Summit Blvd, WY', status: 'Inactive', created_at: '2024-04-10' },
//   { id: 15, name: 'Pioneer Pharma', contact: 'Mona Pink', email: 'mona@pioneerpharma.com', phone: '+1-555-0115', address: '468 Pioneer Ave, ND', status: 'Active', created_at: '2024-04-15' },
//   { id: 16, name: 'Atlas Distributors', contact: 'Nina Gray', email: 'nina@atlasdist.com', phone: '+1-555-0116', address: '579 Atlas Dr, SD', status: 'Active', created_at: '2024-04-20' },
//   { id: 17, name: 'Galaxy Meds', contact: 'Oscar Brown', email: 'oscar@galaxymeds.com', phone: '+1-555-0117', address: '680 Galaxy St, NE', status: 'Active', created_at: '2024-04-25' },
// ];
function formatCustomDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;

  const day = d.getDate();
  const month = d.getMonth() + 1; // Months are 0-based
  const year = d.getFullYear();

  // 🔹 Return in D/M/YYYY format (no padding, no names)
  return `${day}/${month}/${year}`;
}

const SuppliersList = () => {
  const { suppliers, deleteSupplier, fetchSuppliers } = useSuppliers();
  // const [suppliers, setSuppliers] = useState(mockSuppliers);
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const handleEdit = (supplier) => {
    setSelectedSupplierId(supplier.id);
    setIsEditOpen(true);
  };

  const handleView = (supplier) => {
    navigate(`/inventory/suppliers/suppliers-view/${supplier.id}`);
  };

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete.id);
      toast.success('Supplier deleted successfully!');
      setIsDeleteOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteOpen(false);
    setSupplierToDelete(null);
  };

  const handleRefresh = () => {
    // Refresh suppliers data
    fetchSuppliers();
    toast.success('Suppliers list refreshed!');
  };

  // Transform data for table
  const tableData = suppliers.map((supplier) => ({
    ...supplier,
    id: supplier.id || supplier.supplier_id, // Handle different ID field names
    name: supplier.name || supplier.supplier_name, // Handle both name formats
    contact: supplier.contact || supplier.supplier_contact,
    email: supplier.email || supplier.supplier_email,
    phone: supplier.phone || supplier.supplier_contact, // Use contact for phone if phone doesn't exist
    address: supplier.address || supplier.supplier_address,
    status: supplier.status || 'Active', // Default to Active if status is missing
    created_at: supplier.created_at || new Date().toISOString(), // Default to current date if missing
    supplierInfo: {
      name: supplier.name || supplier.supplier_name,
      contact: supplier.contact || supplier.supplier_contact,
      img: null
    },
    contactInfo: {
      email: supplier.email || supplier.supplier_email,
      phone: supplier.phone || supplier.supplier_contact
    },
    formatted_date: supplier.created_at
      ? new Date(supplier.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      })
      : 'N/A'
  }));

  const columns = [
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
    // {
    //   accessorKey: 'id',
    //   header: ({ table }) => {
    //     const checkboxRef = React.useRef(null);

    //     useEffect(() => {
    //       if (checkboxRef.current) {
    //         checkboxRef.current.indeterminate = table.getIsSomeRowsSelected();
    //       }
    //     }, [table.getIsSomeRowsSelected()]);

    //     return (
    //       <input
    //         type="checkbox"
    //         className="custom-table-checkbox"
    //         ref={checkboxRef}
    //         checked={table.getIsAllRowsSelected()}
    //         onChange={table.getToggleAllRowsSelectedHandler()}
    //       />
    //     );
    //   },
    //   cell: ({ row }) => (
    //     <input
    //       type="checkbox"
    //       className="custom-table-checkbox"
    //       checked={row.getIsSelected()}
    //       disabled={!row.getCanSelect()}
    //       onChange={row.getToggleSelectedHandler()}
    //     />
    //   ),
    //   meta: {
    //     headerClassName: 'width-30',
    //   },
    // },
    {
      accessorKey: 'supplierInfo',
      header: () => 'Supplier Name',
      cell: (info) => {
        const supplier = info.getValue();
        return (
          <div className="hstack gap-3">
            {supplier?.img ? (
              <div className="avatar-image avatar-md">
                <img src={supplier.img} alt="avatar" className="img-fluid" />
              </div>
            ) : (
              <div className="text-white avatar-text user-avatar-text avatar-md">
                {supplier.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            )}
            <div>
              <span className="text-truncate-1-line fw-semibold">{supplier.name}</span>
              {/* <small className="fs-12 fw-normal text-muted d-block">
                <FiUser size={12} className="me-1" />
                {supplier.contact}
              </small> */}
            </div>
          </div>
        );
      }
    },
    {
      id: 'contactInfo',
      header: () => 'Contact Info',
      cell: ({ row }) => (
        <div>
          <div className="d-flex align-items-center mb-1">
            <FiMail size={12} className="me-2 text-muted" />
            <span className="text-truncate-1-line">{row.original.email}</span>
          </div>
          <div className="d-flex align-items-center">
            <FiPhone size={12} className="me-2 text-muted" />
            <span className="text-muted">{row.original.phone}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'address',
      header: () => 'Address',
      cell: (info) => (
        <span className="text-muted text-truncate-1-line" style={{ maxWidth: '200px', display: 'inline-block' }}>
          {info.getValue()}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: () => 'Status',
      cell: (info) => {
        const status = info.getValue();
        const statusColor = status === 'Active' ? 'success' : status === 'Inactive' ? 'danger' : 'warning';
        return (
          <span className={`badge bg-soft-${statusColor} text-${statusColor}`}>
            {status}
          </span>
        );
      }
    },
    {
      accessorKey: 'created_at',
      header: () => 'Created At',
    },
    {
      accessorKey: 'actions',
      header: () => "Actions",
      cell: info => (
        <div className="hstack gap-2">
          <button
            className="avatar-text avatar-md"
            title="View"
            onClick={() => handleView(info.row.original)}
          >
            <FiEye />
          </button>
          <button
            className="avatar-text avatar-md"
            title="Edit"
            onClick={() => handleEdit(info.row.original)}
          >
            <FiEdit3 />
          </button>
          <button
            className="avatar-text avatar-md"
            title="Delete"
            onClick={() => handleDeleteClick(info.row.original)}
          >
            <FiTrash2 />
          </button>
        </div>
      ),
      meta: {
        headerClassName: 'text-end'
      }
    },
  ];

  return (
    <>
      <PageHeader >
        <SuppliersHeader />
      </PageHeader>
      <div className="main-content">
        <div className="row">
          <div className="col-12">
            <Table
              data={tableData}
              columns={columns}
              emptyMessage="No suppliers found"
              cardHeader={
                <h5 className="card-title">Suppliers List</h5>
              }
            />
          </div>
        </div>
      </div>
      {isEditOpen && (
        <SuppliersEditModal
          isOpen={isEditOpen}
          supplierId={selectedSupplierId}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedSupplierId(null);
          }}
        />
      )}
      <SupplierDeleteModal
        isOpen={isDeleteOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier?"
        itemName={supplierToDelete?.name || supplierToDelete?.supplier_name}
      />
      <Footer />
    </>
  );
};

export default SuppliersList; 