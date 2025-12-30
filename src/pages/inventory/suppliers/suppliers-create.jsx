import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiSave, FiX, FiTruck, FiUser, FiPhone, FiMail, FiMapPin, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSuppliers } from '../../../contentApi/SuppliersProvider';

const SuppliersCreate = () => {
  const [form, setForm] = useState({
    supplier_name: '',
    // contactPerson: '',
    supplier_email: '',
    supplier_contact: '',
    supplier_address: '',
    tax_no: '',
    payment_terms: '30',
    // status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Local addSupplier: saves to localStorage and shows a toast
  const { addSupplier } = useSuppliers();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Enhanced validation
    if (!form.supplier_name.trim()) {
      toast.error('Please enter supplier name');
      setLoading(false);
      return;
    }

    if (form.supplier_name.trim().length < 2) {
      toast.error('Supplier name must be at least 2 characters long');
      setLoading(false);
      return;
    }

    if (form.supplier_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supplier_email)) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Prepare cleaned data
      const cleanedData = {
        ...form,
        supplier_name: form.supplier_name.trim(),
        // contact_person: form.contactPerson?.trim() || "",
        supplier_email: form.supplier_email?.trim() || "",
        supplier_contact: form.supplier_contact?.trim() || "",
        supplier_address: form.supplier_address?.trim() || "",
        // city: form.city?.trim() || "",
        // state: form.state?.trim() || "",
        // zip_code: form.zipCode?.trim() || "",
        tax_no: form.tax_no?.trim() || "",
        payment_terms: form.payment_terms,
        // status: form.status
      };

      await addSupplier(cleanedData);
      navigate('/inventory/suppliers/suppliers-list');
      toast.success('Successfully added supplier')
    } catch (error) {
      console.error('Error adding supplier:', error);
      // toast.error('Failed to add supplier');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory/suppliers/suppliers-list');
  };

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-secondary me-3"
              onClick={handleCancel}
            >
              <FiArrowLeft className="me-2" />
              Back
            </button>
            {/* <div>
              <h4 className="mb-1 fw-bold">Add New Supplier</h4>
              <p className="text-muted mb-0">Create a new supplier profile</p>
            </div> */}
          </div>
        </div>
      </PageHeader>

      <div className="main-content">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card shadow-sm">
              <div className="card-header bg-light border-bottom">
                <div className="d-flex align-items-center">
                  <div className="avatar-text user-avatar-text avatar-lg me-3 bg-primary">
                    <FiTruck size={24} className="text-white" />
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">Supplier Information</h5>
                    <p className="text-muted mb-0">Enter the supplier details below</p>
                  </div>
                </div>
              </div>

              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    {/* Basic Information */}
                    <div className="col-12">
                      <h6 className="fw-bold mb-3 text-primary">
                        <FiUser size={16} className="me-2" />
                        Basic Information
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          Supplier Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="supplier_name"
                          className="form-control"
                          value={form.supplier_name}
                          onChange={handleChange}
                          placeholder="Enter supplier company name"
                          required
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Enter the official company or business name
                        </div>
                      </div>
                    </div>

                    {/* <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">Contact Person</label>
                        <input
                          type="text"
                          name="contactPerson"
                          className="form-control"
                          value={form.contactPerson}
                          onChange={handleChange}
                          placeholder="Enter contact person name"
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Primary contact person at the supplier
                        </div>
                      </div>
                    </div> */}

                    <div className="col-md-6">
                      <div className="form-group">
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
                            placeholder="Enter email address"
                          />
                        </div>
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Business email for communication
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
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
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Primary contact phone number
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold mb-3 text-info">
                        <FiMapPin size={16} className="me-2" />
                        Address Information
                      </h6>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label fw-medium">Address</label>
                        <input
                          type="text"
                          name="supplier_address"
                          className="form-control"
                          value={form.supplier_address}
                          onChange={handleChange}
                          placeholder="Enter complete address"
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Full business address including street and building number
                        </div>
                      </div>
                    </div>

                    {/* <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label fw-medium">City</label>
                        <input
                          type="text"
                          name="city"
                          className="form-control"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Enter city"
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label fw-medium">State</label>
                        <input
                          type="text"
                          name="state"
                          className="form-control"
                          value={form.state}
                          onChange={handleChange}
                          placeholder="Enter state"
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label fw-medium">ZIP Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          className="form-control"
                          value={form.zipCode}
                          onChange={handleChange}
                          placeholder="Enter ZIP code"
                        />
                      </div>
                    </div> */}

                    {/* Business Information */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-bold mb-3 text-warning">
                        <FiTruck size={16} className="me-2" />
                        Business Information
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">Tax ID / GST Number</label>
                        <input
                          type="text"
                          name="tax_no"
                          className="form-control"
                          value={form.tax_no}
                          onChange={handleChange}
                          placeholder="Enter tax identification number"
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Tax identification or GST registration number
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
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
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Default payment terms for this supplier
                        </div>
                      </div>
                    </div>

                    {/* <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">Status</label>
                        <select
                          name="status"
                          className="form-select"
                          value={form.status}
                          onChange={handleChange}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Current status of the supplier
                        </div>
                      </div>
                    </div> */}
                  </div>

                  <div className="d-flex gap-3 mt-4 pt-4 border-top">
                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={loading}
                    >
                      <FiSave size={16} className='me-2' />
                      {loading ? 'Adding...' : 'Add Supplier'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <FiX size={16} className='me-2' />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SuppliersCreate; 