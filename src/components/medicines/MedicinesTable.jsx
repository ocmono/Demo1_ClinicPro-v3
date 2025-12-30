import React, { useMemo, useEffect, useState, useRef } from 'react';
import Table from '@/components/shared/table/Table';
import {
    FiEdit3, FiEye, FiMoreHorizontal, FiPrinter, FiTrash2, FiFilter, FiPlusCircle
} from 'react-icons/fi';
import Dropdown from '@/components/shared/Dropdown';
import { Link } from 'react-router-dom';
import { useMedicines } from "../../context/MedicinesContext";
import useCardTitleActions from "@/hooks/useCardTitleActions";
import { toast } from 'react-toastify';
import EditMedicineModal from './EditMedicineModal';
import ViewMedicineModal from './ViewMedicineModal';
import AddVariationModal from './AddVariationModal';

const actionsOptions = [
    { label: "Edit", icon: <FiEdit3 /> },
    { label: "Print", icon: <FiPrinter /> },
    { label: "Delete", icon: <FiTrash2 /> },
    { label: "Add Variation", icon: <FiPlusCircle /> },
];

const MedicinesTable = ({
    onAddClick = () => { },
    onEditClick = () => { },
    onViewClick = () => { },
    showAddButton = false,
    canDelete = true,
    canEdit = true,
    canView = true,
    canPrint = true,
    showPrint = true,
    cardHeader,
    refreshKey,
}) => {
    const { medicines, deleteMedicine, addProductVariations, fetchMedicines } = useMedicines();
    const { isRemoved } = useCardTitleActions();
    const printRef = useRef();
    const [forcePageSize, setForcePageSize] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [medicineToDelete, setMedicineToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [medicineToEdit, setMedicineToEdit] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [medicineToView, setMedicineToView] = useState(null);
    const [showAddVariationModal, setShowAddVariationModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    if (isRemoved) return null;

    // Predefined categories including vaccines
    const predefinedCategories = [
        'Vaccines',
        'Antibiotics',
        'Pain Relief',
        'Vitamins & Supplements',
        'Cardiovascular',
        'Diabetes',
        'Respiratory',
        'Gastrointestinal',
        'Dermatological',
        'Neurological',
        'Psychiatric',
        'Oncology',
        'Emergency Medicine',
        'Medical Devices',
        'Surgical Supplies',
        'Diagnostic Tools'
    ];

    // Get unique categories from medicines
    const uniqueCategories = useMemo(() => {
        const categories = medicines.map(medicine => medicine.category).filter(Boolean);
        return [...new Set(categories)];
    }, [medicines]);

    // Combine predefined and existing categories, with vaccines first
    const allCategories = useMemo(() => {
        const existingCategories = uniqueCategories.filter(cat => !predefinedCategories.includes(cat));
        return ['Vaccines', ...predefinedCategories.filter(cat => cat !== 'Vaccines'), ...existingCategories];
    }, [uniqueCategories]);

    // Filter medicines based on status and category
    const filteredMedicines = useMemo(() => {
        return medicines.filter(medicine => {
            const statusMatch = statusFilter === 'all' ||
                (statusFilter === 'active' && medicine.status) ||
                (statusFilter === 'inactive' && !medicine.status);

            const categoryMatch = categoryFilter === 'all' || medicine.category === categoryFilter;

            return statusMatch && categoryMatch;
        });
    }, [medicines, statusFilter, categoryFilter]);

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");

        const printHTML = `
      <html>
        <head>
          <title>Print Medicines</title>
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
          <h2>Products List</h2>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Total Stock</th>
                <th>Price Range</th>
                <th>Variations</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${medicines.map((medicine) => {
            const totalStock = medicine.variations?.reduce((total, v) => total + (parseInt(v.stock) || 0), 0) || 0;
            const priceRange = medicine.variations?.length > 0 ? {
                min: Math.min(...medicine.variations.map(v => parseFloat(v.price) || 0)),
                max: Math.max(...medicine.variations.map(v => parseFloat(v.price) || 0))
            } : { min: 0, max: 0 };
            const priceDisplay = priceRange.min === priceRange.max ? priceRange.min : `${priceRange.min} - ${priceRange.max}`;

            return `
                  <tr>
                    <td>${medicine.name || "—"}</td>
                    <td>${medicine.brand || "—"}</td>
                    <td>${medicine.category || "—"}</td>
                    <td>${totalStock}</td>
                    <td>${priceDisplay}</td>
                    <td>${medicine.variations?.length || 0} variations</td>
                    <td>${medicine.status ? 'Active' : 'Inactive'}</td>
                  </tr>
                `;
        }).join('')}
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

    const getStockStatus = (stock) => {
        if (stock === 0) return { text: 'Out of Stock', class: 'danger' };
        if (stock < 20) return { text: 'Low Stock', class: 'warning' };
        return { text: 'In Stock', class: 'success' };
    };

    const handleDeleteClick = (medicine) => {
        setMedicineToDelete(medicine);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!medicineToDelete) return;

        setIsDeleting(true);
        try {
            const medicineId = medicineToDelete.id;
            const result = await deleteMedicine(medicineId);
            if (result.success) {
                toast.success('Medicine deleted successfully!');
                setShowDeleteModal(false);
                setMedicineToDelete(null);
            } else {
                console.log(`Failed to delete medicine: ${result.error}`);
                // toast.error(`Failed to delete medicine: ${result.error}`);
            }
        } catch (error) {
            console.log('Failed to delete medicine');
            // toast.error('Failed to delete medicine');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setMedicineToDelete(null);
    };

    const handleEditClick = (medicine) => {
        setMedicineToEdit(medicine);
        setShowEditModal(true);
    };

    const handleEditSave = (updatedMedicine) => {
        // This will be handled by the EditMedicineModal component
        setShowEditModal(false);
        setMedicineToEdit(null);
    };

    const handleEditCancel = () => {
        setShowEditModal(false);
        setMedicineToEdit(null);
    };

    const handleViewClick = (medicine) => {
        setMedicineToView(medicine);
        setShowViewModal(true);
    };

    const handleViewClose = () => {
        setShowViewModal(false);
        setMedicineToView(null);
    };

    // Add this function to handle adding variations
    const handleAddVariation = (product) => {
        setSelectedProduct(product);
        setShowAddVariationModal(true);
    };

    const handleSaveVariation = async (productId, variationData) => {
        try {
            const result = await addProductVariations(productId, variationData);
            if (result.success) {
                toast.success('Variation added successfully!');
                // Refresh the medicines data
                await fetchMedicines();
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.log(`Failed to add variation: ${error.message}`)
            // toast.error(`Failed to add variation: ${error.message}`);
            throw error;
        }
    };

    const handleAddVariationClose = () => {
        setShowAddVariationModal(false);
        setSelectedProduct(null);
    };


    const tableData = useMemo(() => filteredMedicines.map((medicine, index) => {
        const totalStock = medicine.variations?.reduce((total, v) => total + (parseInt(v.stock) || 0), 0) || 0;
        const priceRange = medicine.variations?.length > 0 ? {
            min: Math.min(...medicine.variations.map(v => parseFloat(v.price) || 0)),
            max: Math.max(...medicine.variations.map(v => parseFloat(v.price) || 0))
        } : { min: 0, max: 0 };

        return {
            id: medicine.id || index,
            name: medicine.name || 'N/A',
            brand: medicine.brand || 'N/A',
            category: medicine.category || 'N/A',
            totalStock: totalStock,
            priceRange: priceRange,
            variations: medicine.variations || [],
            status: medicine.status,
            actions: medicine,
        };
    }), [filteredMedicines]);

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
        //         const checkboxRef = useRef(null);
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
        //     meta: { headerClassName: 'width-30' },
        // },
        {
            accessorKey: 'name',
            header: () => 'Product Name',
            cell: ({ getValue, row }) => {
                const name = getValue();
                const variations = row.original.variations;
                return (
                    <div>
                        <div className="fw-bold">{name}</div>
                        <small className="text-muted">
                            {variations.length} variation{variations.length !== 1 ? 's' : ''}
                        </small>
                    </div>
                );
            }
        },
        {
            accessorKey: 'category',
            header: () => 'Category',
            cell: ({ getValue }) => (
                <span className="badge bg-secondary">{getValue()}</span>
            ),
        },
        {
            accessorKey: 'brand',
            header: () => 'Brand',
            cell: ({ getValue }) => (
                <span className="badge bg-info">{getValue()}</span>
            ),
        },
        {
            accessorKey: 'totalStock',
            header: () => 'Total Stock',
            cell: ({ getValue }) => {
                const stock = getValue();
                const stockStatus = getStockStatus(stock);
                return (
                    <div>
                        <span className={`badge bg-${stockStatus.class}`}>{stock}</span>
                        <br />
                        <small className="text-muted">{stockStatus.text}</small>
                    </div>
                );
            }
        },
        {
            accessorKey: 'priceRange',
            header: () => 'Price Range',
            cell: ({ getValue }) => {
                const range = getValue();
                return (
                    <strong>
                        {range.min === range.max ? range.min : `${range.min} - ${range.max}`}
                    </strong>
                );
            }
        },
        {
            accessorKey: 'variations',
            header: () => 'Variations',
            cell: ({ getValue }) => {
                const variations = getValue();
                return (
                    <div className="d-flex flex-column">
                        {variations.slice(0, 2).map((variation, idx) => (
                            <small key={idx} className="text-muted">
                                {variation.sku}: {variation.stock} units
                            </small>
                        ))}
                        {variations.length > 2 && (
                            <small className="text-muted">
                                +{variations.length - 2} more
                            </small>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: 'status',
            header: () => 'Status',
            cell: ({ getValue }) => (
                <span className={`badge bg-${getValue() ? 'success' : 'secondary'}`}>
                    {getValue() ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            accessorKey: 'actions',
            header: () => "Actions",
            cell: ({ row }) => (
                <div className="hstack gap-2">
                    {canView && (
                        <Link to="#" onClick={() => handleViewClick(row.original.actions)} className="avatar-text avatar-md">
                            <FiEye />
                        </Link>
                    )}
                    <Dropdown
                        dropdownItems={actionsOptions}
                        triggerClass="avatar-md"
                        triggerPosition={"0,21"}
                        triggerIcon={<FiMoreHorizontal />}
                        onClick={async (actionLabel) => {
                            const medicine = row.original.actions;
                            const medicineId = medicine.id || row.original.id;

                            if (actionLabel === "Edit") {
                                handleEditClick(medicine);
                            }
                            else if (actionLabel === "View") {
                                handleViewClick(medicine);
                            }
                            else if (actionLabel === "Delete") {
                                handleDeleteClick(medicine);
                            }
                            else if (actionLabel === "Add Variation") {
                                handleAddVariation(medicine);
                            }
                        }}
                    />
                </div>
            ),
            meta: { headerClassName: 'text-end' }
        },
    ];

    return (
        <div>
            {/* Filter Controls
            <div className="row mb-3">
                <div className="col-md-6 col-lg-4">
                    <div className="form-group">
                        <label className="form-label">
                            <FiFilter className="me-1" />
                            Filter by Status
                        </label>
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4">
                    <div className="form-group">
                        <label className="form-label">
                            <FiFilter className="me-1" />
                            Filter by Category
                        </label>
                        <select
                            className="form-select"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {allCategories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-md-12 col-lg-4">
                    <div className="form-group">
                        <label className="form-label text-muted">
                            Results
                        </label>
                        <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-2">
                                {filteredMedicines.length} of {medicines.length}
                            </span>
                            {(statusFilter !== 'all' || categoryFilter !== 'all') && (
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => {
                                        setStatusFilter('all');
                                        setCategoryFilter('all');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div> */}

            <Table
                data={tableData}
                columns={columns}
                onPrint={handlePrint}
                showPrint={showPrint}
                printRef={printRef}
                forcePageSize={forcePageSize}
                emptyMessage="No medicines found. Add your first medicine to get started."
                cardHeader={cardHeader}
            />

            {/* View Medicine Modal */}
            {showViewModal && medicineToView && (
                <ViewMedicineModal
                    medicine={medicineToView}
                    onClose={handleViewClose}
                />
            )}

            {/* Edit Medicine Modal */}
            {showEditModal && medicineToEdit && (
                <EditMedicineModal
                    medicine={medicineToEdit}
                    onClose={handleEditCancel}
                    onSave={handleEditSave}
                />
            )}

            {showAddVariationModal && selectedProduct && (
                <AddVariationModal
                    product={selectedProduct}
                    onClose={handleAddVariationClose}
                    onSave={handleSaveVariation}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-overlay" onClick={handleDeleteCancel}></div>
                    <div className="modal-dialog modal-dialog-centered" style={{ "z-index": "9999" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <FiTrash2 className="me-2 text-danger" />
                                    Delete Medicine
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleDeleteCancel}
                                    disabled={isDeleting}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center">
                                    <div className="mb-3">
                                        <FiTrash2 size={48} className="text-danger" />
                                    </div>
                                    <h6 className="mb-3">Are you sure you want to delete this medicine?</h6>
                                    {medicineToDelete && (
                                        <div className="alert alert-light">
                                            <strong>{medicineToDelete.name}</strong>
                                            <br />
                                            <small className="text-muted">
                                                Brand: {medicineToDelete.brand} | Category: {medicineToDelete.category}
                                            </small>
                                        </div>
                                    )}
                                    <p className="text-muted mb-0">
                                        This action cannot be undone. All medicine data and variations will be permanently deleted.
                                    </p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleDeleteCancel}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <FiTrash2 className="me-1" />
                                            Delete Medicine
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicinesTable;