import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Table from "@/components/shared/table/Table";
import {
  FiPackage,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiPlus,
  FiBox,
  FiTag,
  FiCalendar,
  FiLayers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import { useMedicines } from "../../../context/MedicinesContext";
import Footer from '@/components/shared/Footer';

const ProductVariations = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { getAllProductVariations } = useMedicines();
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch product variations
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // If productId is provided, filter by product, otherwise get all variations
        const filters = productId ? { product_id: productId } : {};
        const result = await getAllProductVariations(filters);

        if (result.success) {
          console.log("Fetched variations:", result.data);
          setVariations(result.data);
        } else {
          console.log("Failed to load product variations")
          // toast.error("Failed to load product variations");
          setVariations([]);
        }
      } catch (error) {
        console.error("Error fetching variations:", error);
        // toast.error("Failed to load product variations");
        setVariations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, getAllProductVariations]);

  // Handlers
  const handleView = (variation) => {
    navigate(`/products/variations/view/${variation.id}`);
  };

  const handleEdit = (variation) => {
    toast.info(`Editing variation ${variation.sku}`);
  };

  const handleDelete = (variation) => {
    if (window.confirm(`Delete variation ${variation.sku}?`)) {
      setVariations((prev) => prev.filter((v) => v.id !== variation.id));
      toast.success("Variation deleted successfully!");
    }
  };

  // Format expiry date to YYYY-MM-DD format
  const formatExpiryDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return "N/A";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      // Format to YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Check if expiry date is near (within 30 days) or expired
  const getExpiryStatus = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'normal';

    try {
      const expiryDate = new Date(dateString);
      const today = new Date();
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff < 0) return 'expired'; // Already expired
      if (daysDiff <= 30) return 'near'; // Expiring within 30 days
      return 'normal'; // More than 30 days
    } catch (error) {
      return 'normal';
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    const map = {
      Active: "bg-success",
      Inactive: "bg-secondary",
      OutOfStock: "bg-danger",
    };
    return (
      <span className={`badge ${map[status] || "bg-secondary"} small`}>
        {status}
      </span>
    );
  };

  // Function to safely get variation data with fallbacks
  const getVariationData = (variation, key) => {
    const value = variation[key];

    // Handle different possible field names for the same data
    if (key === 'stock') {
      return variation.stock !== undefined ? variation.stock :
        variation.quantity !== undefined ? variation.quantity : 0;
    }

    if (key === 'price') {
      return variation.price !== undefined ? variation.price :
        variation.cost_price !== undefined ? variation.cost_price : 0;
    }

    if (key === 'unit') {
      return variation.unit || variation.packaging_unit || 'N/A';
    }

    if (key === 'batch_code') {
      return variation.batch_code || variation.batch_number || 'N/A';
    }

    if (key === 'expiry_date') {
      return variation.expiry_date || variation.expiration_date || null;
    }

    if (key === 'status') {
      return variation.status || (variation.is_active ? 'Active' : 'Inactive');
    }

    return value !== undefined ? value : 'N/A';
  };

  // Columns for Table
  const columns = [
    {
      accessorKey: "id",
      header: () => "ID",
      cell: (info) => (
        <span className="fw-medium text-muted">#{info.getValue()}</span>
      ),
    },
    {
      accessorKey: "sku",
      header: () => "SKU",
      cell: (info) => <span className="fw-medium">{info.getValue()}</span>,
    },
    {
      accessorKey: "unit",
      header: () => "Unit",
      cell: (info) => getVariationData(info.row.original, 'unit'),
    },
    {
      accessorKey: "batch_code",
      header: () => "Batch",
      cell: (info) => getVariationData(info.row.original, 'batch_code'),
    },
    {
      accessorKey: "expiry_date",
      header: () => (
        <div className="d-flex align-items-center gap-1">
          <FiCalendar size={14} />
          <span>Expiry Date</span>
        </div>
      ),
      cell: (info) => {
        const expiryDate = getVariationData(info.row.original, 'expiry_date');
        const formattedDate = formatExpiryDate(expiryDate);
        const expiryStatus = getExpiryStatus(expiryDate);

        const statusConfig = {
          expired: { class: 'text-danger fw-bold', icon: '⚠️' },
          near: { class: 'text-warning fw-bold', icon: '⏳' },
          normal: { class: 'text-muted', icon: '' }
        };

        const config = statusConfig[expiryStatus] || statusConfig.normal;

        return (
          <div className="d-flex align-items-center gap-1">
            {config.icon && <span>{config.icon}</span>}
            <span className={config.class}>
              {formattedDate}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: () => "Price",
      cell: (info) => {
        const price = getVariationData(info.row.original, 'price');
        return (
          <span className="fw-medium text-success">
            ₹{typeof price === 'number' ? price.toFixed(2) : price}
          </span>
        );
      },
    },
    {
      accessorKey: "stock",
      header: () => "Stock",
      cell: (info) => {
        const stock = getVariationData(info.row.original, 'stock');
        const stockNumber = typeof stock === 'number' ? stock : parseInt(stock) || 0;
        return (
          <span className={`badge ${stockNumber > 0 ? "bg-success" : "bg-danger"}`}>
            {stockNumber}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => "Status",
      cell: (info) => getStatusBadge(info.getValue() ? "Active" : "Inactive"),
    },
    // {
    //   accessorKey: "actions",
    //   header: () => "Actions",
    //   cell: (info) => {
    //     const row = info.row.original;
    //     return (
    //       <div className="hstack gap-2 justify-content-start">
    //         <button
    //           className="avatar-text avatar-md"
    //           title="View"
    //           onClick={() => handleView(row)}
    //         >
    //           <FiEye />
    //         </button>
    //         <button
    //           className="avatar-text avatar-md"
    //           title="Edit"
    //           onClick={() => handleEdit(row)}
    //         >
    //           <FiEdit3 />
    //         </button>
    //         <button
    //           className="avatar-text avatar-md"
    //           title="Delete"
    //           onClick={() => handleDelete(row)}
    //         >
    //           <FiTrash2 />
    //         </button>
    //       </div>
    //     );
    //   },
    // },
  ];

  return (
    <>
      <PageHeader />
      <div className="product-variations main-content">
        <Table
          data={variations}
          columns={columns}
          showPrint={false}
          cardHeader={<h5 class="card-title mb-0">Variations List</h5>}
          emptyMessage={
            <div className="text-center py-4">
              <div className="text-muted mb-2">
                <FiPackage size={32} className="opacity-50" />
              </div>
              <h6 className="text-muted">No product variations found</h6>
              <p className="text-muted small mb-3">
                Get started by adding your first variation
              </p>
              <div className="d-flex justify-content-center align-items-center">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate("/products/add-variation")}
                >
                  <FiPlus size={14} className="me-1" />
                  Add Variation
                </button>
              </div>
            </div>
        }
          loading={loading}
        />
      </div>
      <Footer />
    </>
  );
};

export default ProductVariations;
