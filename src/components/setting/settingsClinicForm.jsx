import { useState } from 'react';
import { toast } from 'react-toastify';
import PerfectScrollbar from 'react-perfect-scrollbar'
import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting'
import Footer from '@/components/shared/Footer'
import { FiCamera } from 'react-icons/fi'
import useImageUpload from '@/hooks/useImageUpload'

const defaultDetails = {
  name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  gst_no: '',
  logo: '', // base64 or url
};

const SettingsClinicForm = () => {
  const { handleImageUpload, uploadedImage } = useImageUpload()
  const [details, setDetails] = useState(defaultDetails);
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = e => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleLogo = e => {
    const file = e.target.files[0];
    if (!file) return;

    setDetails(prev => ({ ...prev, logo: file }));

    const reader = new FileReader();
    reader.onload = ev => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const clearForm = () => {
    setDetails(defaultDetails);
    setLogoPreview('');
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!details.name.trim()) {
      toast.error('Clinic name is required');
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", details.name.trim());
      formData.append("address", details.address || "");
      formData.append("phone", details.phone || "");
      formData.append("email", details.email || "");
      formData.append("website", details.website || "");
      formData.append("gst_no", details.gst_no || "");

      if (details.logo instanceof File) {
        formData.append("logo", details.logo);
      }

      console.log("Submitting FormData:");
      for (let [k, v] of formData.entries()) {
        console.log(k, v);
      }

      const response = await fetch(
        "https://bkdemo1.clinicpro.cc/clinic-details/add",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ ONLY auth header
          },
          body: formData,
        }
      );

      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("access_token");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend error:", data);
        throw new Error(data?.detail?.[0]?.msg || "Failed to save clinic details");
      }

      toast.success("Clinic details added successfully!");
      clearForm();

    } catch (error) {
      console.error("Error adding clinic details:", error);
      // toast.error(error.message || "Failed to add clinic details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-area">
      <PerfectScrollbar>
        <PageHeaderSetting />
        <div className="content-area-body">
          <div className="row">
            <div className="col-12">
              <div className="card stretch stretch-full">
                <div className="card-header">
                  <h5 className="card-title mb-0">Add Clinic Details</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Clinic Logo</label>
                      <div className="mb-3">
                        <label
                          htmlFor="clinicLogo"
                          className="wd-100 ht-100 position-relative overflow-hidden border border-gray-2 rounded d-inline-block"
                          style={{ cursor: "pointer" }}
                        >
                          {/* Show uploaded or default image */}
                          <img
                            src={logoPreview || uploadedImage || "/images/logo-clinicpro.png"}
                            className="upload-pic img-fluid rounded h-100 w-100"
                            alt="Clinic Logo"
                          />
                          {/* Overlay camera icon */}
                          <div className="position-absolute start-50 top-50 translate-middle hstack align-items-center justify-content-center upload-button">
                            <FiCamera size={24} />
                          </div>
                          {/* Hidden file input */}
                          <input
                            id="clinicLogo"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleLogo}
                          />
                        </label>

                        {logoPreview && (
                          <div className="mt-2 d-flex align-items-center gap-2">
                            <img
                              src={logoPreview}
                              alt="Logo Preview"
                              className="rounded border"
                              style={{ width: 56, height: 56, objectFit: "cover" }}
                            />
                            <small className="text-muted">Logo Preview</small>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Clinic Name <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        name="name"
                        value={details.name}
                        onChange={handleChange}
                        placeholder="Enter clinic name"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-control"
                        name="phone"
                        value={details.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        name="address"
                        value={details.address}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Enter clinic address"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        className="form-control"
                        name="email"
                        type="email"
                        value={details.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Website</label>
                      <input
                        className="form-control"
                        name="website"
                        value={details.website}
                        onChange={handleChange}
                        placeholder="Enter website URL"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">GST/Registration No.</label>
                      <input
                        className="form-control"
                        name="gst_no"
                        value={details.gst_no}
                        onChange={handleChange}
                        placeholder="Enter GST or registration number"
                      />
                    </div>
                    <div className="col-12">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Adding...
                            </>
                          ) : (
                            'Add Clinic Details'
                          )}
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={clearForm}
                          disabled={saving}
                          type="button"
                        >
                          Clear Form
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </ PerfectScrollbar>
    </div >
  );
};

export default SettingsClinicForm; 