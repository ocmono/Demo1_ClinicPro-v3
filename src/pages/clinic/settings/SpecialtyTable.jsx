import React, { useState, useEffect } from "react";
import { FiEdit3, FiTrash2, FiPlus } from "react-icons/fi";
import { useClinicManagement } from "../../contentApi/ClinicMnanagementProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contentApi/AuthContext";

const SpecialtyTable = () => {
  const {
    clinicSpecialities,
    addSpeciality,
    removeSpeciality,
    updateSpeciality,
  } = useClinicManagement();
  const { user } = useAuth();
  const [newSpeciality, setNewSpeciality] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editedSpecialityValue, setEditedSpecialityValue] = useState("");
  const navigate = useNavigate();

  // Define roles that can see actions
  const canSeeActionsRoles = ["super_admin", "clinic_admin", "doctor", "receptionist"];
  
  // Define roles that can add/edit/delete specialties
  const canManageSpecialtyRoles = ["super_admin", "clinic_admin", "receptionist"];
  
  // Check permissions
  const canSeeActions = user && canSeeActionsRoles.includes(user.role);
  const canManageSpecialty = user && canManageSpecialtyRoles.includes(user.role);

  const handleAddSpeciality = () => {
    if (!canManageSpecialty) {
      toast.error("You don't have permission to add specialties");
      return;
    }

    if (
      newSpeciality.trim() &&
      !clinicSpecialities.find(
        (spec) => spec.speciality === newSpeciality.trim()
      )
    ) {
      addSpeciality(newSpeciality.trim());
      setNewSpeciality("");
    } else {
      toast.error("Speciality already exists or is invalid", {
        autoClose: 4000,
      });
    }
  };

  const handleSaveEdit = () => {
    if (!canManageSpecialty) {
      toast.error("You don't have permission to edit specialties");
      return;
    }

    if (editedSpecialityValue.trim()) {
      const updatedSpeciality = editedSpecialityValue.trim();
      const specialityId = clinicSpecialities[editIndex].id;
      updateSpeciality(specialityId, updatedSpeciality);
      setEditIndex(null);
    } else {
      toast.error("Specialty name cannot be empty", { autoClose: 4000 });
    }
  };

  const handleDelete = (speciality) => {
    if (!canManageSpecialty) {
      toast.error("You don't have permission to delete specialties");
      return;
    }
    removeSpeciality(speciality);
  };

  return (
    <div className="specialty-table-wrapper">
      {/* Section: Add New Specialty */}
      {canManageSpecialty && (
        <div className="card add-specialty-card">
          <h5 className="mb-3">Add New Speciality</h5>
          <div className="add-specialty-form">
            <input
              type="text"
              className="form-control"
              placeholder="Enter new specialty"
              value={newSpeciality}
              onChange={(e) => setNewSpeciality(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleAddSpeciality}>
              Add
            </button>
          </div>
        </div>
      )}

      {/* Section: Specialty Table */}
      <div className="card specialty-table-card mt-4">
        <h5 className="mb-3">Available Specialities</h5>
        <div className="table-responsive">
          <table className="table speciality-table table-striped table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Speciality</th>
                {canSeeActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {clinicSpecialities.length === 0 ? (
                <tr>
                  <td colSpan={canSeeActions ? "3" : "2"} className="text-center">
                    No specialities added yet.
                  </td>
                </tr>
              ) : (
                clinicSpecialities.map((speciality, index) => (
                  <tr key={speciality.id}>
                    <td>{index + 1}</td>
                    <td>
                      {editIndex === index && canManageSpecialty ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editedSpecialityValue}
                          onChange={(e) =>
                            setEditedSpecialityValue(e.target.value)
                          }
                        />
                      ) : (
                        speciality.speciality
                      )}
                    </td>
                    {canSeeActions && (
                      <td>
                        {editIndex === index && canManageSpecialty ? (
                          <div className="action-row">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={handleSaveEdit}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditIndex(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="action-row">
                            {canManageSpecialty && (
                              <>
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => {
                                    setEditIndex(index);
                                    setEditedSpecialityValue(speciality.speciality);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDelete(speciality)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                            <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={() =>
                                navigate(`/clinic-configuration/${speciality.id}`)
                              }
                            >
                              Configure
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyTable;
