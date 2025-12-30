import React, { useEffect, useState } from "react";
import { FiX, FiSave, FiTruck, FiUser, FiPhone, FiMail, FiMapPin, FiInfo } from "react-icons/fi";
import { toast } from "react-toastify";
import { useSuppliers } from "../../../contentApi/SuppliersProvider";

const SuppliersEditModal = ({ isOpen, onClose, supplierId }) => {
  const { suppliers, editSupplier } = useSuppliers();
  const supplier = suppliers.find((s) => String(s.id) === String(supplierId));

  const [form, setForm] = useState({
    supplier_name: "",
    // contactPerson: "",
    supplier_email: "",
    supplier_contact: "",
    supplier_address: "",
    // city: "",
    // state: "",
    // zipCode: "",
    tax_no: "",
    payment_terms: "30",
    // status: "Active",
  });

  useEffect(() => {
    if (supplier) {
      setForm({
        supplier_name: supplier.supplier_name || supplier.name || "",
        // contactPerson: supplier.contactPerson || supplier.contact || "",
        supplier_email: supplier.supplier_email || supplier.email || "",
        supplier_contact: supplier.supplier_contact || supplier.phone || "",
        supplier_address: supplier.supplier_address || supplier.address || "",
        // city: supplier.city || "",
        // state: supplier.state || "",
        // zipCode: supplier.zipCode || "",
        tax_no: supplier.tax_no || supplier.taxId || "",
        payment_terms: supplier.payment_terms || supplier.paymentTerms || "30",
        // status: supplier.status || "Active",
      });
    }
  }, [supplier]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.supplier_name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    // Prepare cleaned data matching API format
    const cleanedData = {
      ...form,
      supplier_name: form.supplier_name.trim(),
      supplier_email: form.supplier_email?.trim() || "",
      supplier_contact: form.supplier_contact?.trim() || "",
      supplier_address: form.supplier_address?.trim() || "",
      tax_no: form.tax_no?.trim() || "",
      payment_terms: form.payment_terms,
    };

    editSupplier(supplierId, cleanedData);
    toast.success("Supplier updated successfully!");
    onClose();
  };

  return (
    <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold d-flex align-items-center">
              <FiTruck className="me-2" /> Edit Supplier
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Basic Information */}
                <div className="col-12">
                  <h6 className="fw-bold mb-3 text-primary">
                    <FiUser className="me-2" /> Basic Information
                  </h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Supplier Name *</label>
                  <input
                    type="text"
                    name="supplier_name"
                    className="form-control"
                    value={form.supplier_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* <div className="col-md-6">
                  <label className="form-label fw-medium">Contact Person</label>
                  <input
                    type="text"
                    name="supplier_contact"
                    className="form-control"
                    value={form.supplier_contact}
                    onChange={handleChange}
                  />
                </div> */}

                <div className="col-md-6">
                  <label className="form-label fw-medium">Email</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiMail size={14} />
                    </span>
                    <input
                      type="email"
                      name="supplier_email"
                      className="form-control"
                      value={form.supplier_email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Phone</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FiPhone size={14} />
                    </span>
                    <input
                      type="tel"
                      name="supplier_contact"
                      className="form-control"
                      value={form.supplier_contact}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="col-12 mt-4">
                  <h6 className="fw-bold mb-3 text-info">
                    <FiMapPin className="me-2" /> Address Information
                  </h6>
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium">Address</label>
                  <input
                    type="text"
                    name="supplier_address"
                    className="form-control"
                    value={form.supplier_address}
                    onChange={handleChange}
                  />
                </div>

                {/* <div className="col-md-4">
                  <label className="form-label fw-medium">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-medium">State</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    value={form.state}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-medium">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    className="form-control"
                    value={form.zipCode}
                    onChange={handleChange}
                  />
                </div> */}

                {/* Business Info */}
                <div className="col-12 mt-4">
                  <h6 className="fw-bold mb-3 text-warning">
                    <FiTruck className="me-2" /> Business Information
                  </h6>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Tax ID / GST Number</label>
                  <input
                    type="text"
                    name="tax_no"
                    className="form-control"
                    value={form.tax_no}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Payment Terms</label>
                  <select
                    name="payment_terms"
                    className="form-select"
                    value={form.payment_terms}
                    onChange={handleChange}
                  >
                    <option value="15">Net 15 days</option>
                    <option value="30">Net 30 days</option>
                    <option value="45">Net 45 days</option>
                    <option value="60">Net 60 days</option>
                    <option value="90">Net 90 days</option>
                    <option value="COD">Cash on Delivery</option>
                  </select>
                </div>

                {/* <div className="col-md-6">
                  <label className="form-label fw-medium">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending Approval</option>
                  </select>
                </div> */}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              <FiX size={16} className="me-1" />
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" onClick={handleSubmit}>
              <FiSave size={16} className="me-1" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersEditModal;
