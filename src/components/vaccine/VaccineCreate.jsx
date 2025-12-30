import React, { useState } from 'react';
import CardHeader from '@/components/shared/CardHeader';
import CardLoader from '@/components/shared/CardLoader';
import useCardTitleActions from '@/hooks/useCardTitleActions';
import { useVaccine } from '../../context/VaccineContext';
import { toast } from 'react-toastify';
import { useAuth } from '../../contentApi/AuthContext';

const VaccineAdd = () => {
  const { addVaccine } = useVaccine();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    vaccine_name: '',
    age_group: '',
    dose_number: '',
    description: '',
    route_of_administration: '',
    site: '',
    min_age_days: '',
    max_age_days: '',
    mandatory: false,
    repeat_interval_days: '',
    is_active: true
  });

  const {
    refreshKey,
    isRemoved,
    isExpanded,
  } = useCardTitleActions();

  if (isRemoved) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vaccine_name || !formData.dose_number) {
      toast.error("Vaccine name and dose number are required");
      return;
    }
    try {
      const payload = {
        ...formData,
        dose_number: parseInt(formData.dose_number),
        min_age_days: parseInt(formData.min_age_days),
        max_age_days: parseInt(formData.max_age_days),
        repeat_interval_days: parseInt(formData.repeat_interval_days),
        created_by: user?.id || 0
      }
      console.log("Payload Data", payload);
      await addVaccine(payload); // You can rename or separate vaccine API later
      toast.success("Vaccine added!");
      setFormData({
        vaccine_name: '',
        age_group: '',
        dose_number: '',
        description: '',
        route_of_administration: '',
        site: '',
        min_age_days: '',
        max_age_days: '',
        mandatory: false,
        repeat_interval_days: '',
        is_active: true,
      });
    } catch (err) {
      toast.error("Error adding vaccine. Try again.");
    }
  };

  return (
    <div className='main-content'>
      <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
        <CardHeader title="Add Vaccine" />
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mt-3">
              <div className="col-md-6">
                <label>Vaccine Name</label>
                <input type="text" name="vaccine_name" value={formData.vaccine_name} onChange={handleChange}
                  className="form-control" placeholder="Enter Vaccine Name" />
              </div>
              <div className="col-md-6">
                <label>Age Group</label>
                <input type="text" name="age_group" value={formData.age_group} onChange={handleChange}
                  className="form-control" placeholder="Enter Age Group" />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-6">
                <label>Dose Number</label>
                <input type="number" name="dose_number" value={formData.dose_number} onChange={handleChange}
                  className="form-control" placeholder="Enter Dose Number" />
              </div>
              <div className="col-md-6">
                <label>Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange}
                  className="form-control" placeholder="Enter Description" />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-6">
                <label>Route of Administration</label>
                <input type="text" name="route_of_administration" value={formData.route_of_administration}
                  onChange={handleChange} className="form-control" placeholder="Enter Route (e.g. Oral, IM)" />
              </div>
              <div className="col-md-6">
                <label>Site</label>
                <input type="text" name="site" value={formData.site} onChange={handleChange} className="form-control"
                  placeholder="Enter Site (e.g. Arm, Thigh)" />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-6">
                <label>Min Age Days</label>
                <input type="number" name="min_age_days" value={formData.min_age_days} onChange={handleChange}
                  className="form-control" placeholder="Enter Minimum Age in Days" />
              </div>
              <div className="col-md-6">
                <label>Max Age Days</label>
                <input type="number" name="max_age_days" value={formData.max_age_days} onChange={handleChange}
                  className="form-control" placeholder="Enter Maximum Age in Days" />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-6">
                <label>Repeat Interval Days</label>
                <input type="number" name="repeat_interval_days" value={formData.repeat_interval_days} onChange={handleChange}
                  className="form-control" placeholder="Enter Interval in Days" />
              </div>
              <div className="col-md-6">
                <label className="form-label d-block mb-1">Mandatory</label>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="mandatory" value="true"
                    checked={formData.mandatory === true} onChange={(e) => setFormData(prev => ({
                      ...prev, mandatory:
                        e.target.value === 'true'
                    }))}
                  />
                  <label className="form-check-label">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="mandatory" value="false"
                    checked={formData.mandatory === false} onChange={(e) => setFormData(prev => ({
                      ...prev, mandatory:
                        e.target.value === 'true'
                    }))}
                  />
                  <label className="form-check-label">No</label>
                </div>
              </div>
              <div className="col-md-6 mt-3">
                <label className="form-label d-block mb-1">Active Status</label>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="isActiveSwitch" checked={formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                    }
                  />
                  <label className="form-check-label" htmlFor="isActiveSwitch">
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </label>
                </div>
              </div>
            </div>
            <div className='d-flex align-items-center justify-content-start px-2'>
              <button type="submit" className="btn btn-primary mt-3 mb-3">Add Vaccine</button>
            </div>
          </form>
        </div>
        <CardLoader refreshKey={refreshKey} />
      </div>
    </div>
  );
};

export default VaccineAdd;