import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import CardHeader from '@/components/shared/CardHeader';
import Table from '@/components/shared/table/Table';
import { FiEdit3, FiEye, FiTrash2, FiPhone, FiMail, FiRefreshCw, FiGlobe, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import ManufacturersEditModal from './manufacturers-edit';
import ManufacturersHeader from '@/components/inventory/ManufacturersHeader';
import DeleteConfirmationModal from '../../../pages/clinic/settings/DeleteConfirmationModal';
import { useManufacturers } from '../../../contentApi/ManufacturersProvider';
import Footer from '@/components/shared/Footer';

const ManufacturersList = () => {
    const { manufacturers, deleteManufacturer, fetchManufacturers, loading } = useManufacturers();
    const navigate = useNavigate();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedManufacturerId, setSelectedManufacturerId] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [manufacturerToDelete, setManufacturerToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = (manufacturer) => {
        setSelectedManufacturerId(manufacturer.id);
        setIsEditOpen(true);
    };

    const handleView = (manufacturer) => {
        navigate(`/inventory/manufacturers/manufacturers-view/${manufacturer.id}`);
    };

    const handleDeleteClick = (manufacturer) => {
        setManufacturerToDelete(manufacturer);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!manufacturerToDelete) return;

        try {
            setIsDeleting(true);
            await deleteManufacturer(manufacturerToDelete.id);
            toast.success('Manufacturer deleted successfully!');
            setIsDeleteOpen(false);
            setManufacturerToDelete(null);
        } catch (error) {
            toast.error('Failed to delete manufacturer');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRefresh = async () => {
        try {
            await fetchManufacturers();
            toast.success('Manufacturers list refreshed!');
        } catch (error) {
            toast.error('Failed to refresh manufacturers list');
        }
    };

    // Transform data for table
    const tableData = manufacturers.map((manufacturer) => ({
        ...manufacturer,
        id: manufacturer.id || manufacturer.manufacturer_id,
        name: manufacturer.name || manufacturer.manufacturer_name,
        email: manufacturer.email || manufacturer.manufacturer_email,
        phone: manufacturer.phone || manufacturer.manufacturer_phone,
        reg_no: manufacturer.reg_no || manufacturer.registration_number,
        license_no: manufacturer.license_no || manufacturer.license_number,
        website: manufacturer.website || manufacturer.manufacturer_website,
        mp_certified: manufacturer.mp_certified || false,
        o_certified: manufacturer.o_certified || false,
        address: manufacturer.address || manufacturer.manufacturer_address,
        created_at: manufacturer.created_at || new Date().toISOString(),
        manufacturerInfo: {
            name: manufacturer.name || manufacturer.manufacturer_name,
            reg_no: manufacturer.reg_no || manufacturer.registration_number,
            img: null
        },
        contactInfo: {
            email: manufacturer.email || manufacturer.manufacturer_email,
            phone: manufacturer.phone || manufacturer.manufacturer_phone,
            website: manufacturer.website || manufacturer.manufacturer_website
        },
        certifications: {
            mp_certified: manufacturer.mp_certified || false,
            o_certified: manufacturer.o_certified || false
        },
        formatted_date: manufacturer.created_at
            ? new Date(manufacturer.created_at).toLocaleDateString('en-US', {
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
        //     accessorKey: 'id',
        //     header: ({ table }) => {
        //         const checkboxRef = React.useRef(null);

        //         useEffect(() => {
        //             if (checkboxRef.current) {
        //                 checkboxRef.current.indeterminate = table.getIsSomeRowsSelected();
        //             }
        //         }, [table.getIsSomeRowsSelected()]);

        //         return (
        //             <input
        //                 type="checkbox"
        //                 className="custom-table-checkbox"
        //                 ref={checkboxRef}
        //                 checked={table.getIsAllRowsSelected()}
        //                 onChange={table.getToggleAllRowsSelectedHandler()}
        //             />
        //         );
        //     },
        //     cell: ({ row }) => (
        //         <input
        //             type="checkbox"
        //             className="custom-table-checkbox"
        //             checked={row.getIsSelected()}
        //             disabled={!row.getCanSelect()}
        //             onChange={row.getToggleSelectedHandler()}
        //         />
        //     ),
        //     meta: {
        //         headerClassName: 'width-30',
        //     },
        // },
        {
            accessorKey: 'manufacturerInfo',
            header: () => 'Manufacturer Name',
            cell: (info) => {
                const manufacturer = info.getValue();
                return (
                    <div className="hstack gap-3">
                        <div className="text-white avatar-text user-avatar-text avatar-md">
                            {manufacturer.name?.charAt(0)?.toUpperCase() || 'M'}
                        </div>
                        <div>
                            <span className="text-truncate-1-line fw-semibold">{manufacturer.name}</span>
                            <small className="fs-12 fw-normal text-muted d-block">
                                Reg: {manufacturer.reg_no || 'N/A'}
                            </small>
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
                        <span className="text-truncate-1-line">{row.original.email || 'N/A'}</span>
                    </div>
                    <div className="d-flex align-items-center mb-1">
                        <FiPhone size={12} className="me-2 text-muted" />
                        <span className="text-muted">{row.original.phone || 'N/A'}</span>
                    </div>
                    {row.original.website && (
                        <div className="d-flex align-items-center">
                            <FiGlobe size={12} className="me-2 text-muted" />
                            <a
                                href={row.original.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-decoration-none"
                            >
                                Website
                            </a>
                        </div>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'license_no',
            header: () => 'License No.',
            cell: (info) => (
                <span className="text-muted">
                    {info.getValue() || 'Not provided'}
                </span>
            )
        },
        {
            id: 'certifications',
            header: () => 'Certifications',
            cell: ({ row }) => (
                <div>
                    <div className="d-flex align-items-center mb-1">
                        {row.original.mp_certified ? (
                            <FiCheckCircle size={12} className="me-2 text-success" />
                        ) : (
                            <FiXCircle size={12} className="me-2 text-danger" />
                        )}
                        <small className="text-muted">MP Certified</small>
                    </div>
                    <div className="d-flex align-items-center">
                        {row.original.o_certified ? (
                            <FiCheckCircle size={12} className="me-2 text-success" />
                        ) : (
                            <FiXCircle size={12} className="me-2 text-danger" />
                        )}
                        <small className="text-muted">O Certified</small>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'address',
            header: () => 'Address',
            cell: (info) => (
                <span className="text-muted text-truncate-1-line" style={{ maxWidth: '200px', display: 'inline-block' }}>
                    {info.getValue() || 'Not provided'}
                </span>
            )
        },
        {
            accessorKey: 'created_at',
            header: () => 'Created At',
            cell: (info) => (
                <span className="text-muted">
                    {info.row.original.formatted_date}
                </span>
            )
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
            <PageHeader>
                <ManufacturersHeader />
            </PageHeader>
            <div className="main-content">
                <div className="row">
                    <div className="col-12">
                        {/* <CardHeader
                                title="Manufacturers List"
                                refresh={handleRefresh}
                                refreshIcon={<FiRefreshCw />}
                                refreshing={loading}
                            /> */}
                            <div className="card-body custom-card-action p-0">
                                {loading ? (
                                    <div className="d-flex justify-content-center align-items-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading manufacturers...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <Table
                                        data={tableData}
                                        columns={columns}
                                        emptyMessage="No manufacturers found"
                                        cardHeader={
                                            <h5 className="card-title">Manufacturers List</h5>
                                        }
                                    />
                                )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditOpen && (
                <ManufacturersEditModal
                    isOpen={isEditOpen}
                    manufacturerId={selectedManufacturerId}
                    onClose={() => {
                        setIsEditOpen(false);
                        setSelectedManufacturerId(null);
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setManufacturerToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Manufacturer"
                message="Are you sure you want to delete this manufacturer? This will also remove all associated data."
                itemName={manufacturerToDelete?.name}
                loading={isDeleting}
            />
            <Footer />
        </>
    );
};

export default ManufacturersList;