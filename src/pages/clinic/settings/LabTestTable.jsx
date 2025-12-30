import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit3, FiTrash2 } from "react-icons/fi";
import { useClinicManagement } from "../../contentApi/ClinicMnanagementProvider";

const LabTestTable = ({ specialityId }) => {
  const {
    labTestsBySpeciality,
    fetchLabTests,
    addLabTest,
    updateLabTest,
    deleteLabTest,
  } = useClinicManagement();

  const [newTest, setNewTest] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchLabTests(specialityId);
  }, [specialityId]);

  const handleRefresh = () => {
    fetchLabTests(specialityId);
    setNewTest("");
    setEditIndex(null);
    setEditValue("");
  };

  const labTestsRaw = labTestsBySpeciality[specialityId];
  const labTests = Array.isArray(labTestsRaw) ? labTestsRaw : [];

  const handleAdd = () => {
    if (newTest.trim()) {
      addLabTest(specialityId, { test_name: newTest.trim() });
      setNewTest("");
    }
  };

  const handleSaveEdit = (testId) => {
    updateLabTest(specialityId, { id: testId, test_name: editValue.trim() });
    setEditIndex(null);
  };

  return (
    <div className="labtest-table-wrapper">
      {/* Add Lab Test */}
      <div className="card add-labtest-card">
        <h5 className="mb-3">Add Lab Test</h5>
        <div className="add-labtest-form">
          <input
            type="text"
            className="form-control"
            placeholder="Enter lab test name"
            value={newTest}
            onChange={(e) => setNewTest(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAdd}>
            Add
          </button>
          <a href="#" onClick={handleRefresh} className="d-flex">
            <div
              className="avatar-text avatar-md"
              data-bs-toggle="tooltip"
              data-bs-trigger="hover"
              title="Refresh"
            >
              <i>
                <FiPlus />
              </i>
            </div>
          </a>
        </div>
      </div>

      {/* Lab Test Table */}
      <div className="card labtest-table-card mt-4">
        <h5 className="mb-3">Available Lab Tests</h5>
        <div className="table-responsive">
          <table className="table labtest-table table-striped table-bordered">
            <thead >
              <tr>
                <th>#</th>
                <th>Test Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labTests.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">
                    No lab tests added yet.
                  </td>
                </tr>
              ) : (
                labTests.map((test, i) => (
                  <tr key={test.id}>
                    <td>{i + 1}</td>
                    <td>
                      {editIndex === i ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                      ) : (
                        test.test_name
                      )}
                    </td>
                    <td>
                      {editIndex === i ? (
                        <div className="action-row">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleSaveEdit(test.id)}
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
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              setEditIndex(i);
                              setEditValue(test.test_name);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => deleteLabTest(specialityId, test.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
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

export default LabTestTable;
