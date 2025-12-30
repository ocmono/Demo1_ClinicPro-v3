import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiInfo } from 'react-icons/fi';
import { useReceptionist } from "../../../context/ReceptionistContext";

const ReceptionistsEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { receptionists, editReceptionist } = useReceptionist();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    age: '',
    address: '',
    gender: 'Male',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [receptionist, setReceptionist] = useState(null);

  useEffect(() => {
    if (receptionists.length > 0) {
      // Find receptionist by ID
      const foundReceptionist = receptionists.find(r => r.id == id);
      
      if (foundReceptionist) {
        setReceptionist(foundReceptionist);
        setFormData({
          name: foundReceptionist.name || '',
          email: foundReceptionist.email || '',
          mobile: foundReceptionist.mobile || '',
          age: foundReceptionist.age || '',
          address: foundReceptionist.address || '',
          gender: foundReceptionist.gender || 'Male',
          status: foundReceptionist.status || 'Active'
        });
        setInitialLoading(false);
      } else if (!initialLoading) {
        toast.error('Receptionist not found');
        navigate('/clinic/receptionists');
      }
    }
  }, [id, receptionists, navigate, initialLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim()) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await editReceptionist(id, formData);
      toast.success('Receptionist updated successfully!');
      navigate('/clinic/receptionists');
    } catch (error) {
      console.error('Error updating receptionist:', error);
      toast.error('Failed to update receptionist');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/clinic/receptionists');
  };

  if (initialLoading) {
    return (
      <>
        <PageHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button 
                className="btn btn-icon btn-light"
                onClick={handleCancel}
              >
                <FiArrowLeft />
              </button>
              <div>
                <h4 className="mb-1 fw-bold">Edit Receptionist</h4>
                <p className="text-muted mb-0">Update receptionist information</p>
              </div>
            </div>
          </div>
        </PageHeader>
        
        <div className="main-content">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading receptionist details...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button 
              className="btn btn-icon btn-light"
              onClick={handleCancel}
            >
              <FiArrowLeft />
            </button>
            <div>
              <h4 className="mb-1 fw-bold">Edit Receptionist</h4>
              <p className="text-muted mb-0">Update receptionist information</p>
            </div>
          </div>
        </div>
      </PageHeader>
      
      <div className="main-content">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-light border-bottom">
                <div className="d-flex align-items-center">
                  <div className="avatar-text user-avatar-text avatar-lg me-3 bg-primary">
                    <FiUser size={24} className="text-white" />
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">Receptionist Information</h5>
                    <p className="text-muted mb-0">Update the receptionist details</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter full name"
                          required
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Enter the complete name of the receptionist
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                          required
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          This email will be used for login and notifications
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          Mobile <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          name="mobile"
                          className="form-control"
                          value={formData.mobile}
                          onChange={handleChange}
                          placeholder="Enter 10-digit mobile number"
                          required
                          maxLength={10}
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Enter exactly 10 digits without country code
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          Age <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          name="age"
                          className="form-control"
                          value={formData.age}
                          onChange={handleChange}
                          placeholder="Enter age"
                          min={18}
                          max={100}
                          required
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Minimum age requirement is 18 years
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label fw-medium">Address</label>
                        <input
                          type="text"
                          name="address"
                          className="form-control"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter complete address"
                        />
                        <div className="form-text">
                          <FiMapPin size={14} className="me-1" />
                          Enter the full residential address
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">Gender</label>
                        <select
                          name="gender"
                          className="form-select"
                          value={formData.gender}
                          onChange={handleChange}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Select the appropriate gender option
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">Status</label>
                        <select
                          name="status"
                          className="form-select"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Active receptionists can access the system
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-3 mt-4 pt-4 border-top">
                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={loading}
                    >
                      <FiSave size={16} className='me-2' />
                      {loading ? 'Updating...' : 'Update Receptionist'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={handleCancel}
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

export default ReceptionistsEdit; 