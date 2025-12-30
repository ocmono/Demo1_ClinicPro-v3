import React, { useState } from 'react';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import { toast } from 'react-toastify';
import { useAuth } from '../../contentApi/AuthContext';
import { useBooking } from '../../contentApi/BookingProvider';
import { useVaccine } from "../../context/VaccineContext";

const VaccinePatientAdd = () => {
  const { user } = useAuth();
  const { doctors } = useBooking();
  const { vaccines, addPatientVaccine } = useVaccine();
  const [formData, setFormData] = useState({
    patient_name: '',
    dob: '',
    gender: '',
    parent_name: '',
    contact_number: '',
    address: '',
    birth_weight: '',
    registration_date: '',
    notes: '',
    doctor_id: '',
    schedule_id: '',
  });

  const { refreshKey, isRemoved, isExpanded } = useCardTitleActions();
  if (isRemoved) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patient_name || !formData.dob || !formData.doctor_id) {
      toast.error("Patient name, date of birth, and doctor ID are required");
      return;
    }

    try {
      const payload = {
        ...formData,
        birth_weight: parseFloat(formData.birth_weight),
        doctor_id: parseInt(formData.doctor_id),
        schedule_id: parseInt(formData.schedule_id),
        registration_date: new Date(formData.registration_date).toISOString(),
        created_by: user?.id || 0,
      };
      await addPatientVaccine(payload);
      console.log("Payload to submit:", payload);
      // await yourSubmitFunction(payload);
      toast.success("Patient vaccine data added successfully");

      // Reset form
      setFormData({
        patient_name: '',
        dob: '',
        gender: '',
        parent_name: '',
        contact_number: '',
        address: '',
        birth_weight: '',
        registration_date: '',
        notes: '',
        doctor_id: '',
        schedule_id: '',
      });
    } catch (err) {
      toast.error("Error submitting data. Try again.");
    }
  };

  return (
    <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
      <CardHeader title="Add Patient Vaccine" />
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row mt-3">
            <div className="col-md-6">
              <label>Patient Name</label>
              <input type="text" name="patient_name" value={formData.patient_name} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label>Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="form-control" />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="form-control">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="col-md-6">
              <label>Parent Name</label>
              <input type="text" name="parent_name" value={formData.parent_name} onChange={handleChange} className="form-control" />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>Contact Number</label>
              <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control" />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>Birth Weight (kg)</label>
              <input type="number" step="0.01" name="birth_weight" value={formData.birth_weight} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label>Registration Date</label>
              <input type="datetime-local" name="registration_date" value={formData.registration_date} onChange={handleChange} className="form-control" />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>Doctor</label>
              <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} className="form-control">
                <option value="">Select Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>{doc.firstName} {doc.lastName} - {doc.drSpeciality}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label>Vaccine Name</label>
              <select name="schedule_id" value={formData.schedule_id} onChange={handleChange} className="form-control">
                <option value="">Select Vaccine</option>
                {vaccines.map((v) => (
                  <option key={v.id} value={v.id}>{v.vaccine_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-12">
              <label>Notes</label>
              <textarea className='form-control border ps-3' placeholder='Notes' name="notes" value={formData.notes} onChange={handleChange} />
            </div>
          </div>

          <div className='d-flex align-items-center justify-content-start px-2'>
            <button type="submit" className="btn btn-primary mt-3 mb-3">Add Patient Vaccine</button>
          </div>
        </form>
      </div>
      <CardLoader refreshKey={refreshKey} />
    </div>
  );
};

export default VaccinePatientAdd;
