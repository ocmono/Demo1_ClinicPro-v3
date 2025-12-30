import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import { FiArrowLeft, FiUserPlus, FiSave, FiX } from 'react-icons/fi';
import { 
  ClinicPageHeader, 
  ClinicCard, 
  ClinicFormField, 
  ClinicFormActions 
} from '@/components/clinic/ClinicDesignSystem';

const CreateUser = ({ isTab = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    role: "",
    password: "",
    verifyPassword: "",
    createdDate: new Date().toISOString().slice(0, 10),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorList([]);

    if (formData.password !== formData.verifyPassword) {
      setErrorList(["Passwords do not match"]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("https://bkdemo1.clinicpro.cc/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          username: formData.username.trim(),
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          role: formData.role,
          password: formData.password,
          created_at: formData.createdDate,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("User created successfully!");
        // Trigger a page refresh to update the user list
        window.location.href = '/users';
      } else {
        if (Array.isArray(data.detail)) {
          const messages = data.detail.map((err) => err.msg);
          setErrorList(messages);
          messages.forEach((msg) => toast.error(msg));
        } else {
          setErrorList([data.detail || "User creation failed"]);
          toast.error(data.detail || "User creation failed");
        }
      }
    } catch (err) {
      console.error("User creation error:", err);
      // toast.error("Something went wrong while connecting to the server.");
      setErrorList(["Something went wrong while connecting to the server."]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <>
      {!isTab && (
        <PageHeader>
          <ClinicPageHeader
            title="Create New User"
            subtitle="Add a new user to the system"
            backButton={true}
            onBack={handleCancel}
          />
        </PageHeader>
      )}
      
      <div className={isTab ? '' : 'main-content'}>
        <div className='row justify-content-center'>
          <div className="col-12 col-lg-8">
            <ClinicCard
              title="User Information"
              subtitle="Enter the user details"
              icon={FiUserPlus}
              color="primary"
            >
              {errorList.length > 0 && (
                <div className="alert alert-danger">
                  <h6 className="alert-heading">Please fix the following errors:</h6>
                  {errorList.map((err, i) => (
                    <div key={i} className="mb-1">• {err}</div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <ClinicFormField label="First Name" required>
                        <input
                          name="firstName"
                          type="text"
                          className="form-control"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                        />
                      </ClinicFormField>
                    </div>
                    <div className="col-md-6">
                      <ClinicFormField label="Last Name" required>
                        <input
                          name="lastName"
                          type="text"
                          className="form-control"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
                        />
                      </ClinicFormField>
                    </div>
                  </div>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <ClinicFormField label="Email" required>
                        <input
                          name="email"
                          type="email"
                          className="form-control"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                        />
                      </ClinicFormField>
                    </div>
                    <div className="col-md-6">
                      <ClinicFormField label="Username" required>
                        <input
                          name="username"
                          type="text"
                          className="form-control"
                          required
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Enter username"
                        />
                      </ClinicFormField>
                    </div>
                  </div>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <ClinicFormField label="Role" required>
                        <select
                          name="role"
                          className="form-control"
                          value={formData.role}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select a role</option>
                          <option value="super_admin">Super Admin</option>
                          <option value="clinic_admin">Clinic Admin</option>
                          <option value="admin">Admin</option>
                          <option value="doctor">Doctor</option>
                          <option value="receptionist">Receptionist</option>
                          <option value="accountant">Accountant</option>
                          <option value="pharmacist">Pharmacist</option>
                          <option value="patient">Patient</option>
                        </select>
                      </ClinicFormField>
                    </div>
                    <div className="col-md-6">
                      <ClinicFormField label="Created Date">
                        <input
                          name="createdDate"
                          type="date"
                          className="form-control"
                          value={formData.createdDate}
                          onChange={handleChange}
                        />
                      </ClinicFormField>
                    </div>
                  </div>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <ClinicFormField label="Password" required>
                        <input
                          name="password"
                          type="password"
                          className="form-control"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter password"
                        />
                      </ClinicFormField>
                    </div>
                    <div className="col-md-6">
                      <ClinicFormField label="Confirm Password" required>
                        <input
                          name="verifyPassword"
                          type="password"
                          className="form-control"
                          required
                          value={formData.verifyPassword}
                          onChange={handleChange}
                          placeholder="Confirm password"
                        />
                      </ClinicFormField>
                    </div>
                  </div>
                  
                  <ClinicFormActions
                    onSave={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                    saveText={loading ? 'Creating...' : 'Create User'}
                    cancelText="Cancel"
                  />
                </form>
              </ClinicCard>
            </div>
          </div>
        </div>
      {!isTab && <Footer/>}
    </>
  );
};

export default CreateUser; 